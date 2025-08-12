import React, { useEffect, useMemo } from 'react'
import { useCombatStore } from '../../../stores/combatStore'
import { useGameStore } from '../../../stores/gameStore'
import CombatPanel from '../../combat/CombatPanel'

/**
 * Panneau de combat moderne utilisant Zustand
 */
const ModernCombatPanel = ({
  playerCharacter,
  playerCompanion,
  encounterData,
  onCombatEnd,
  onReplayCombat,
  combatKey,
  onPlayerCastSpell,
  onPlayerTakeDamage,
  onCompanionTakeDamage,
  addCombatMessage,
  combatLog,
  setCombatLog
}) => {
  // Utiliser le composant de combat existant qui fonctionne
  return (
    <CombatPanel
      playerCharacter={playerCharacter}
      playerCompanion={playerCompanion}
      onCombatEnd={onCombatEnd}
      addCombatMessage={addCombatMessage}
      combatLog={combatLog}
      setCombatLog={setCombatLog}
      encounterData={encounterData}
      onPlayerCastSpell={onPlayerCastSpell}
      onPlayerTakeDamage={onPlayerTakeDamage}
      onReplayCombat={onReplayCombat}
      combatKey={combatKey}
      onCompanionTakeDamage={onCompanionTakeDamage}
    />
  )
}

export default ModernCombatPanel