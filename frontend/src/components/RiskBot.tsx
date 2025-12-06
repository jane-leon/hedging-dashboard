import { useMemo } from 'react'
import EuphoricBot from '../assets/icons/riskbot-euphoric.svg'
import HealthyBot from '../assets/icons/riskbot-healthy.svg'
import NervousBot from '../assets/icons/riskbot-nervous.svg'
import StressedBot from '../assets/icons/riskbot-stressed.svg'
import CriticalBot from '../assets/icons/riskbot-critical.svg'
import './ui/riskbot.css'

type RiskBotState = 'euphoric' | 'healthy' | 'nervous' | 'stressed' | 'critical'

interface RiskBotProps {
    volatility: number | null
    size?: 'sm' | 'md' | 'lg'
    showMessage?: boolean
}

export function RiskBot({ volatility, size = 'md', showMessage = true }: RiskBotProps) {
    const state: RiskBotState = useMemo(() => {
        if (volatility === null) return 'healthy'

        // Map volatility to state
        if (volatility < 20) return 'euphoric'
        if (volatility < 30) return 'healthy'
        if (volatility < 45) return 'nervous'
        if (volatility < 60) return 'stressed'
        return 'critical'
    }, [volatility])

    const getBotImage = (botState: RiskBotState): string => {
        const images: Record<RiskBotState, string> = {
            euphoric: EuphoricBot,
            healthy: HealthyBot,
            nervous: NervousBot,
            stressed: StressedBot,
            critical: CriticalBot
        }
        return images[botState]
    }

    const getMessage = (botState: RiskBotState): string => {
        const messages: Record<RiskBotState, string> = {
            euphoric: '🎉 Excellent! Your portfolio is super safe!',
            healthy: '😊 Looking good! Portfolio is well-managed.',
            nervous: '😰 Getting worried... Consider adding protection?',
            stressed: '😱 HIGH RISK! Your portfolio needs protection NOW!',
            critical: '💀 DANGER ZONE! Your portfolio is extremely vulnerable!'
        }
        return messages[botState]
    }

    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-16 h-16',
        lg: 'w-24 h-24'
    }

    if (volatility === null) {
        return null
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`riskbot-container ${sizeClasses[size]}`}>
                <img
                    src={getBotImage(state)}
                    alt={`RiskBot ${state}`}
                    className={`riskbot riskbot-${state} w-full h-full`}
                    style={{ imageRendering: 'pixelated' }}
                />
            </div>
            {showMessage && (
                <div className="text-xs text-center max-w-[200px] leading-tight">
                    {getMessage(state)}
                </div>
            )}
        </div>
    )
}
