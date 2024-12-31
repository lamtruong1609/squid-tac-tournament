import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { authService } from "@/services/authService"
import { useNavigate } from "react-router-dom"

export const Web3LoginButton = () => {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  const handleLogin = async () => {
    try {
      if (!address) return

      // Check if wallet address exists as a player
      const { data: player } = await supabase
        .from('players')
        .select('*')
        .eq('name', address)
        .single()

      if (!player) {
        // Register new player with wallet address
        const { data: newPlayer, error: createError } = await supabase
          .from('players')
          .insert({
            name: address,
            password: '', // Empty password for Web3 users
          })
          .select()
          .single()

        if (createError) throw createError
      }

      // Login using authService
      await authService.loginWithWallet(address)
      toast.success("Successfully logged in with wallet!")
      navigate('/')
    } catch (error) {
      console.error('Web3 login error:', error)
      toast.error("Failed to login with wallet")
      disconnect()
    }
  }

  return (
    <Button 
      onClick={() => {
        if (isConnected) {
          handleLogin()
        } else {
          connect({ connector: connectors[0] })
        }
      }}
      className="w-full"
    >
      {isConnected ? 'Continue with Wallet' : 'Connect Wallet'}
    </Button>
  )
}