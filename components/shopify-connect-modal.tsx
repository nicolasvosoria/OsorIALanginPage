"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle } from "lucide-react"
import { connectShopifyStore } from "@/actions/shopify"
import { toast } from "sonner"

export function ShopifyConnectModal({ onClose }: { onClose: () => void }) {
  const [adminApiToken, setAdminApiToken] = useState("")
  const [storefrontApiToken, setStorefrontApiToken] = useState("")
  const [shopDomain, setShopDomain] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [themeId, setThemeId] = useState<string | null>(null)

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsConnecting(true)

    try {
      const userData = localStorage.getItem("userData")
      if (!userData) {
        throw new Error("User data not found")
      }

      const { email } = JSON.parse(userData)
      const result = await connectShopifyStore(email, shopDomain, adminApiToken, storefrontApiToken, apiKey, secretKey)

      if (result.success) {
        setIsConnected(true)
        setThemeId(result.themeId)
        toast.success(result.message)
        // We don't close the modal immediately to show the success state
        setTimeout(() => {
          onClose()
        }, 3000)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error connecting Shopify store:", error)
      toast.error("Failed to connect Shopify store")
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <form onSubmit={handleConnect} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="shopDomain" className="text-sm text-gray-400">
          Dominio de la tienda
        </Label>
        <Input
          id="shopDomain"
          placeholder="your-store.myshopify.com"
          value={shopDomain}
          onChange={(e) => setShopDomain(e.target.value)}
          className="bg-transparent border-gray-500 text-white placeholder:text-gray-500"
          required
          disabled={isConnected}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="apiKey" className="text-sm text-gray-400">
          Clave API de Shopify
        </Label>
        <Input
          id="apiKey"
          type="password"
          placeholder="Enter your Shopify API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="bg-transparent border-gray-500 text-white placeholder:text-gray-500"
          required
          disabled={isConnected}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="secretKey" className="text-sm text-gray-400">
          Clave secreta de Shopify
        </Label>
        <Input
          id="secretKey"
          type="password"
          placeholder="Enter your Shopify secret key"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          className="bg-transparent border-gray-500 text-white placeholder:text-gray-500"
          required
          disabled={isConnected}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="adminApiToken" className="text-sm text-gray-400">
          Token de acceso API Admin
        </Label>
        <Input
          id="adminApiToken"
          type="password"
          placeholder="shpat_XXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
          value={adminApiToken}
          onChange={(e) => setAdminApiToken(e.target.value)}
          className="bg-transparent border-gray-500 text-white placeholder:text-gray-500"
          required
          disabled={isConnected}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="storefrontApiToken" className="text-sm text-gray-400">
          Token de acceso API Storefront
        </Label>
        <Input
          id="storefrontApiToken"
          type="password"
          placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
          value={storefrontApiToken}
          onChange={(e) => setStorefrontApiToken(e.target.value)}
          className="bg-transparent border-gray-500 text-white placeholder:text-gray-500"
          required
          disabled={isConnected}
        />
      </div>
      <Button
        type="submit"
        disabled={isConnecting || isConnected}
        className={`w-full border-2 border-white text-black bg-white hover:bg-transparent hover:text-white transition-all duration-300 ${isConnected ? "cursor-default" : ""}`}
      >
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Conectando...
          </>
        ) : isConnected ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Tienda {shopDomain} conectada exitosamente
          </>
        ) : (
          "Conectar tienda Shopify"
        )}
      </Button>
    </form>
  )
}
