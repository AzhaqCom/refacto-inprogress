import React, { useState, useMemo } from 'react'
import { useCharacterStore } from '../../../stores/characterStore'
import { useGameStore } from '../../../stores/gameStore'
import ShortRestPanel from '../../rest/ShortRestPanel'
import LongRestPanel from '../../rest/LongRestPanel'

/**
 * Panneau de gestion des repos avec Zustand
 */
const RestPanel = ({
  onRestComplete,
  className = ''
}) => {
  // Stores
  const playerCharacter = useCharacterStore(state => state.playerCharacter)
  const shortRestPlayer = useCharacterStore(state => state.shortRestPlayer)
  const longRestAll = useCharacterStore(state => state.longRestAll)
  
  const { isShortResting, isLongResting, endShortRest, endLongRest } = useGameStore()

  if (!playerCharacter) {
    return null
  }

  const handleSpendHitDie = () => {
    shortRestPlayer(1) // Dépenser 1 dé de vie
  }

  const handleLongRestComplete = () => {
    longRestAll()
    onRestComplete?.('long')
  }

  const handleShortRestComplete = () => {
    endShortRest()
    onRestComplete?.('short')
  }

  if (isLongResting) {
    return (
      <LongRestPanel onRestComplete={handleLongRestComplete} />
    )
  }

  if (isShortResting) {
    return (
      <ShortRestPanel
        playerCharacter={playerCharacter}
        handleSpendHitDie={handleSpendHitDie}
        onEndRest={handleShortRestComplete}
      />
    )
  }

  return (
    <div className="rest-panel">
      <p>Aucun repos en cours</p>
    </div>
  )
}

export default RestPanel