export interface Group {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  invitation_link: string | null;
  invitation_expires_at: string | null;
}

export interface UserGroup {
  id: string;
  created_at: string;
  group_id: string;
  user_id: string;
}

export interface GroupMember {
  user_id: string;
  nickname: string;
  total_points: number;
}
