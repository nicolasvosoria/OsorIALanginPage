import { supabase } from "@/copa-osoria/lib/supabase";
import type { Group, GroupMember } from "@/copa-osoria/types/group";

export async function createGroup(name: string, description: string | null, userId: string): Promise<{ group: Group | null; error: string | null }> {
  // 1. Generate an invitation link (uuid v4 format)
  const invitationLink = crypto.randomUUID();
  
  // Expiration: 7 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // 2. Insert into group
  const { data: groupData, error: groupError } = await supabase
    .from("group")
    .insert([{ 
        name, 
        description, 
        invitation_link: invitationLink,
        invitation_expires_at: expiresAt.toISOString()
    }])
    .select()
    .single();

  if (groupError || !groupData) {
    return { group: null, error: groupError?.message || "Error al crear el grupo" };
  }

  const group = groupData as Group;

  // 2. Insert creator into user_group
  const { error: userGroupError } = await supabase
    .from("user_group")
    .insert([{ group_id: group.id, user_id: userId }]);

  if (userGroupError) {
    return { group: null, error: "Grupo creado pero falló al unirte a él." };
  }

  return { group, error: null };
}

export async function getUserGroups(userId: string): Promise<Group[]> {
  const { data, error } = await supabase
    .from("user_group")
    .select(`
      group:group_id (*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  
  // Extract the group object from the join
  return data
    .map((item: any) => item.group as Group)
    .filter(Boolean);
}

export async function getGroupById(groupId: string): Promise<Group | null> {
  const { data, error } = await supabase
    .from("group")
    .select("*")
    .eq("id", groupId)
    .single();

  if (error || !data) return null;
  return data as Group;
}

export async function getGroupByInvitationLink(link: string): Promise<Group | null> {
  const { data, error } = await supabase
    .from("group")
    .select("*")
    .eq("invitation_link", link)
    .single();

  if (error || !data) return null;
  return data as Group;
}

export async function renewInvitationLink(groupId: string): Promise<{ success: boolean; error: string | null; newLink: string | null }> {
  const newLink = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data, error } = await supabase
    .from("group")
    .update({ 
      invitation_link: newLink,
      invitation_expires_at: expiresAt.toISOString()
    })
    .eq("id", groupId)
    .select();

  if (error) {
    return { success: false, error: error.message, newLink: null };
  }

  // Si data está vacío, significa que RLS (Row Level Security) bloqueó la actualización 
  // porque el usuario no tiene permisos para hacer UPDATE en la tabla 'group'
  if (!data || data.length === 0) {
    return { success: false, error: "Permiso denegado por base de datos (Falta política RLS para UPDATE)", newLink: null };
  }

  return { success: true, error: null, newLink };
}

export async function joinGroup(groupId: string, userId: string): Promise<{ success: boolean; error: string | null }> {
  // First check if already joined
  const { data: existing } = await supabase
    .from("user_group")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    return { success: true, error: null };
  }

  const { error } = await supabase
    .from("user_group")
    .insert([{ group_id: groupId, user_id: userId }]);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

export async function getGroupMembersRanking(groupId: string): Promise<GroupMember[]> {
  // 1. Get user_ids in this group
  const { data: userGroupData, error: ugError } = await supabase
    .from("user_group")
    .select("user_id")
    .eq("group_id", groupId);

  if (ugError || !userGroupData || userGroupData.length === 0) return [];

  const userIds = userGroupData.map((ug) => ug.user_id);

  // 2. Get their usernames from users
  const { data: usersData, error: usersError } = await supabase
    .from("users")
    .select("id, username")
    .in("id", userIds);

  if (usersError || !usersData) return [];

  // 3. Get points from user_score
  const { data: scoresData, error: scoresError } = await supabase
    .from("user_score")
    .select("*")
    .in("user_id", userIds);

  const scoreByUser = new Map<string, number>();
  if (!scoresError && scoresData) {
    for (const row of scoresData) {
        const r = row as Record<string, unknown>;
        const uid = typeof r.user_id === "string" ? r.user_id : null;
        const pts = Number(r.points ?? r.total_points ?? r.score ?? 0) || 0;
        if (uid) scoreByUser.set(uid, (scoreByUser.get(uid) ?? 0) + pts);
    }
  }

  // Combine
  const members: GroupMember[] = usersData.map((u) => ({
    user_id: String(u.id),
    nickname: String(u.username || "Usuario"),
    total_points: scoreByUser.get(String(u.id)) ?? 0,
  }));

  // Sort descending
  return members.sort((a, b) => b.total_points - a.total_points);
}
