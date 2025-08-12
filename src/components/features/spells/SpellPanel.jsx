import React, { useMemo, useState } from 'react'
import { useCharacterStore } from '../../../stores/characterStore'
import { useGameStore } from '../../../stores/gameStore'
import { getModifier } from '../../utils/utils'
import { spells } from '../../../data/spells'
import { SpellSlots } from '../../spells/SpellSlots'
import { SpellList } from '../../spells/SpellList'

/**
 * Panneau de gestion des sorts avec Zustand
 */
const SpellPanel = ({
  className = ''
}) => {
  // Stores
  const playerCharacter = useCharacterStore(state => state.playerCharacter)
  const castSpellPlayer = useCharacterStore(state => state.castSpellPlayer)
  const prepareSpell = useCharacterStore(state => state.prepareSpell)
  const unprepareSpell = useCharacterStore(state => state.unprepareSpell)
  
  const { addCombatMessage } = useGameStore()

  // Vérifier si le personnage peut lancer des sorts
  if (!playerCharacter?.spellcasting) {
    return null
  }

  const spellStats = useMemo(() => ({
    attackModifier: getModifier(playerCharacter.stats[playerCharacter.spellcasting.ability]) + playerCharacter.proficiencyBonus,
    saveDC: 8 + getModifier(playerCharacter.stats[playerCharacter.spellcasting.ability]) + playerCharacter.proficiencyBonus
  }), [playerCharacter])

  const { knownSpells, preparedSpells, cantrips, maxPreparedSpells } = useMemo(() => {
    const prepared = playerCharacter.spellcasting.preparedSpells || []
    const known = playerCharacter.spellcasting.knownSpells || []
    const cantrips = playerCharacter.spellcasting.cantrips || []
    
    // Calculate max prepared spells
    const spellcastingAbility = playerCharacter.spellcasting.ability || 'intelligence'
    const abilityModifier = getModifier(playerCharacter.stats[spellcastingAbility])
    const maxPrepared = abilityModifier + playerCharacter.level
    
    return {
      // Filter out cantrips from known spells and exclude already prepared spells
      knownSpells: known.filter(spellName => {
        const spell = spells[spellName]
        return spell && spell.level > 0 && !prepared.includes(spellName)
      }),
      preparedSpells: prepared,
      cantrips,
      maxPreparedSpells: maxPrepared
    }
  }, [playerCharacter.spellcasting, playerCharacter.stats, playerCharacter.level])

  // Gestionnaires d'événements
  const handleCastSpell = (spellName) => {
    if (castSpellPlayer) {
      const spell = spells[spellName]
      if (spell) {
        castSpellPlayer(spell)
        addCombatMessage(`${spell.name} lancé !`, 'spell')
      }
    }
  }

  const handlePrepareSpell = (spellName) => {
    if (prepareSpell) {
      prepareSpell(spellName)
      addCombatMessage(`${spellName} préparé`, 'spell')
    }
  }

  const handleUnprepareSpell = (spellName) => {
    if (unprepareSpell) {
      unprepareSpell(spellName)
      addCombatMessage(`${spellName} retiré`, 'spell')
    }
  }

  return (
    <div className="spellcasting">
      <h4 className="text-xl font-bold mb-4">Sorts de {playerCharacter.class}</h4>
      
      <SpellSlots spellSlots={playerCharacter.spellcasting.spellSlots} />
      
      <SpellList
        title="Grimoire"
        spells={knownSpells}
        character={playerCharacter}
        onPrepareSpell={handlePrepareSpell}
        showPrepareButton={true}
      />
      
      <SpellList
        title={`Sorts Préparés (${preparedSpells.length}/${maxPreparedSpells})`}
        spells={preparedSpells}
        character={playerCharacter}
        onCastSpell={handleCastSpell}
        onUnprepareSpell={handleUnprepareSpell}
        showCastButton={true}
        showUnprepareButton={true}
      />
    </div>
  )
}

export default SpellPanel