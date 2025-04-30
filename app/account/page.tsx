"use client"

import { LogOut, ArrowRight, Sparkles, Zap, ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Background } from "@/components/background"
import { useState, useEffect } from "react"
import { Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Footer } from "@/components/footer"
import { cancelSubscription } from "@/actions/cancel-subscription"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Preloader } from "@/components/preloader"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ShopifyConnectModal } from "@/components/shopify-connect-modal"
import { getShopifyStoreInfo, removeShopifyStore } from "@/actions/shopify"

export default function AccountPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<{ email: string; plan: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isPortalLoading, setIsPortalLoading] = useState(false)
  const [showShopifyModal, setShowShopifyModal] = useState(false)
  const [shopifyDomain, setShopifyDomain] = useState<string | null>(null)

  const handlePortalRedirect = async () => {
    try {
      setIsPortalLoading(true)
      if (!userData?.email) return

      const response = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userData.email }),
      })

      if (!response.ok) {
        throw new Error("Failed to create portal session")
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      toast.error("Failed to redirect to billing portal")
    } finally {
      setIsPortalLoading(false)
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("userData")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUserData(parsedUser)

      // Fetch Shopify store info
      getShopifyStoreInfo(parsedUser.email).then((result) => {
        if (result.success) {
          setShopifyDomain(result.shopifyDomain)
        }
      })
    }
  }, [])

  const handleUpgrade = async (newPlan: string) => {
    setIsLoading(true)
    try {
      if (newPlan === "free") {
        setShowCancelDialog(true)
        setIsLoading(false)
        return
      }
      // Handle upgrade
      router.push(`/payment?plan=${newPlan.toLowerCase()}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelConfirm = async () => {
    try {
      if (!userData?.email) {
        throw new Error("User email not found")
      }
      setIsCanceling(true)
      const result = await cancelSubscription(userData.email)

      if (result.success) {
        // Update local storage
        const updatedUserData = { ...userData, plan: "free" }
        localStorage.setItem("userData", JSON.stringify(updatedUserData))
        setUserData(updatedUserData)
        toast.success(result.message)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error("Cancellation error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to cancel subscription")
    } finally {
      setIsCanceling(false)
      setShowCancelDialog(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("userData")
    router.push("/")
  }

  const handleRemoveShopify = async () => {
    try {
      if (!userData?.email) return

      const result = await removeShopifyStore(userData.email)
      if (result.success) {
        setShopifyDomain(null)
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error removing Shopify store:", error)
      toast.error("Failed to disconnect Shopify store")
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-white overflow-hidden select-none">
      <Preloader />
      <Background />
      {/* Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="bg-black/90 border border-gray-500 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Esto cancelará tu suscripción inmediatamente. Perderás acceso a las funciones premium al final de tu
              período de facturación actual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-2 border-gray-500 bg-transparent text-white hover:bg-gray-500/20"
              disabled={isCanceling}
            >
              No, mantener mi suscripción
            </AlertDialogCancel>
            <AlertDialogAction
              className="border-2 border-white bg-white text-black hover:bg-transparent hover:text-white"
              onClick={handleCancelConfirm}
              disabled={isCanceling}
            >
              {isCanceling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Sí, cancelar suscripción"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Shopify Connect Modal */}
      <Dialog open={showShopifyModal} onOpenChange={setShowShopifyModal}>
        <DialogContent className="bg-black border border-gray-500 text-white">
          <DialogHeader>
            <DialogTitle>Conecta las APIs de tu tienda Shopify</DialogTitle>
            <DialogDescription className="text-gray-400">
              Introduce los datos de tu tienda Shopify para conectar tu cuenta.
            </DialogDescription>
          </DialogHeader>
          <ShopifyConnectModal onClose={() => setShowShopifyModal(false)} />
        </DialogContent>
      </Dialog>

      <div className="relative z-10">
        <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-12">
          <div className="w-full max-w-2xl mb-12">
            <Card className="bg-transparent backdrop-blur-2xl border-gray-500 text-white">
              <CardHeader>
                <CardTitle>Cuenta</CardTitle>
                <CardDescription className="text-gray-400">Administra la configuración de tu cuenta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Email</h3>
                  <p className="text-gray-400">{userData?.email || "Loading..."}</p>
                </div>
                {userData?.plan !== "free" && (
                  <div className="space-y-2">
                    <button
                      onClick={handlePortalRedirect}
                      disabled={isPortalLoading}
                      className="text-sm text-gray-400 hover:text-white transition-colors underline disabled:opacity-50"
                    >
                      {isPortalLoading ? (
                        <>
                          <Loader2 className="inline-block w-3 h-3 animate-spin mr-1" />
                          Redirigiendo...
                        </>
                      ) : (
                        "Gestionar suscripción"
                      )}
                    </button>
                  </div>
                )}
                {shopifyDomain ? (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Tienda Shopify conectada</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-400">{shopifyDomain}</p>
                      <button
                        onClick={handleRemoveShopify}
                        className="text-sm text-gray-400 hover:text-white transition-colors underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setShowShopifyModal(true)}
                    className="w-full mt-4 border-2 border-white text-white bg-transparent hover:bg-white hover:text-black transition-all duration-300"
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Conecta las APIs de tu tienda Shopify
                  </Button>
                )}
                <Button
                  onClick={handleLogout}
                  className="w-full border-2 border-white text-black bg-white hover:bg-transparent hover:text-white transition-all duration-300"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </Button>
              </CardContent>
            </Card>
          </div>

          <section className="w-full max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Tu plan actual</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
                Elige el plan ideal para tus necesidades. Siempre sabrás lo que pagarás.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Free Plan */}
              <div>
                <Card className="relative p-4 sm:p-6 bg-transparent backdrop-blur-2xl border-gray-500 text-white h-full">
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl font-bold">Безплатен</CardTitle>
                    <p className="text-gray-400 text-sm sm:text-base">Идеален за начало</p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-2xl sm:text-4xl font-bold">$0</span>
                      <span className="text-gray-400 ml-2 text-sm sm:text-base">/ month</span>
                    </div>
                    <ul className="space-y-3 text-sm sm:text-base text-gray-300">
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Basic funnel creator
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Test funnel creator
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        24/7 livechat
                      </li>
                    </ul>
                  </CardContent>
                  <Button
                    className="w-full border-2 border-white text-sm sm:text-lg py-4 sm:py-6 px-4 sm:px-8 text-white bg-transparent hover:bg-transparent hover:text-white transition-all duration-300 cursor-not-allowed opacity-80"
                    disabled={true}
                  >
                    {userData?.plan === "free" ? (
                      <>
                        Текущ план
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      "Безплатен план"
                    )}
                  </Button>
                </Card>
              </div>

              {/* Pro Plan */}
              <div>
                <Card className="relative p-4 sm:p-6 bg-transparent backdrop-blur-2xl border-gray-500 text-white h-full">
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl font-bold">Про</CardTitle>
                    <p className="text-gray-400 text-sm sm:text-base">За разрастващи се екипи</p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-2xl sm:text-4xl font-bold">$4.99</span>
                      <span className="text-gray-400 ml-2 text-sm sm:text-base">/ month</span>
                    </div>
                    <ul className="space-y-3 text-sm sm:text-base text-gray-300">
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        All Free features
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Scaling funnel creator
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Facebook ad analysis
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Priority support
                      </li>
                    </ul>
                  </CardContent>
                  <Button
                    onClick={() => handleUpgrade("pro")}
                    disabled={userData?.plan === "pro" || isLoading}
                    className={`w-full border-2 border-white text-sm sm:text-lg py-4 sm:py-6 px-4 sm:px-8 ${
                      userData?.plan === "pro"
                        ? "text-white bg-transparent hover:bg-transparent hover:text-white cursor-not-allowed opacity-80"
                        : "text-black bg-white hover:bg-transparent hover:text-white"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : userData?.plan === "pro" ? (
                      <>
                        Текущ план
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : userData?.plan === "premium" ? (
                      <>
                        Преминете към Про
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Надградете до Про
                        <Zap className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  {userData?.plan === "pro" && (
                    <button
                      onClick={() => handleUpgrade("free")}
                      disabled={isCanceling}
                      className="text-sm text-gray-400 hover:text-white transition-colors underline"
                    >
                      Отказ на абонамент
                    </button>
                  )}
                </Card>
              </div>

              {/* Premium Plan */}
              <div>
                <Card className="relative p-4 sm:p-6 bg-transparent backdrop-blur-2xl border-gray-500 text-white h-full">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-white text-black text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                      Най-популярен
                    </span>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl font-bold">Премиум</CardTitle>
                    <p className="text-gray-400 text-sm sm:text-base">За напреднали потребители</p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-2xl sm:text-4xl font-bold">$29.99</span>
                      <span className="text-gray-400 ml-2 text-sm sm:text-base">/ month</span>
                    </div>
                    <ul className="space-y-3 text-sm sm:text-base text-gray-300">
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        All Pro features
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Get competition info
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Advanced queries and prompts
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        24/7 priority support
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Dedicated account manager
                      </li>
                    </ul>
                  </CardContent>
                  <Button
                    onClick={() => handleUpgrade("premium")}
                    disabled={userData?.plan === "premium" || isLoading}
                    className={`w-full border-2 border-white text-sm sm:text-lg py-4 sm:py-6 px-4 sm:px-8 ${
                      userData?.plan === "premium"
                        ? "text-white bg-transparent hover:bg-transparent hover:text-white cursor-not-allowed opacity-80"
                        : "text-black bg-white hover:bg-transparent hover:text-white"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : userData?.plan === "premium" ? (
                      <>
                        Текущ план
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Надградете до Премиум
                        <Sparkles className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  {userData?.plan === "premium" && (
                    <button
                      onClick={() => handleUpgrade("free")}
                      disabled={isCanceling}
                      className="text-sm text-gray-400 hover:text-white transition-colors underline"
                    >
                      Отказ на абонамент
                    </button>
                  )}
                </Card>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
