import React, { useMemo } from 'react'
import { useCharacterStore, characterSelectors } from '../../../stores'
import { getModifier } from '../../utils/utils'
import { levels } from '../../../data/levels'
import { CollapsibleSection } from '../../ui/CollapsibleSection'
import { StatBlock } from '../../character/StatBlock'
import { AbilityScores } from '../../character/AbilityScores'
import { SkillsList } from '../../character/SkillsList'
import { HPBar } from '../../character/HPBar'
import { XPBar } from '../../character/XPBar'

/**
 * Fiche de personnage modernisée avec stores Zustand
 */
const CharacterSheet = ({ 
  characterType = 'player', // 'player' ou 'companion'
  compact = false
}) => {
  const character = useCharacterStore(
    characterType === 'player' 
      ? characterSelectors.getPlayerCharacter
      : characterSelectors.getPlayerCompanion
  )

  // Calculs memoïsés du personnage
  const characterStats = useMemo(() => {
    if (!character) return null

    const nextLevelXP = levels[character.level + 1]?.xpRequired || character.currentXP
    const currentLevelXP = levels[character.level].xpRequired
    const xpProgress = nextLevelXP > currentLevelXP ? ((character.currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100 : 100

    // Bonus d'attaque de sorts
    const spellAttackBonus = character.spellcasting
      ? getModifier(character.stats[character.spellcasting.ability || 'intelligence']) + character.proficiencyBonus
      : null

    // Bonus d'attaque d'armes (utilise la stat primaire)
    const primaryStat = character.class === 'Roublard' ? 'dexterite' : 'force'
    const weaponAttackBonus = getModifier(character.stats[primaryStat]) + 
      character.proficiencyBonus

    return {
      nextLevelXP,
      currentLevelXP,
      xpProgress,
      spellAttackBonus,
      weaponAttackBonus,
      proficiencyBonus: character.proficiencyBonus
    }
  }, [character])

  const getSaveBonus = (statName) => {
    const isProficient = character.proficiencies.saves.includes(statName)
    return getModifier(character.stats[statName]) + (isProficient ? character.proficiencyBonus : 0)
  }

  if (!character) {
    return null
  }

  return (
    <div className="character-sheet">
      <div className="header">
        <h3>{character.name}</h3>
        <XPBar
          currentXP={character.currentXP}
          nextLevelXP={characterStats.nextLevelXP}
          xpProgress={characterStats.xpProgress}
        />
        <p>Niv. {character.level} {character.race} {character.class}</p>
        <p>Historique : {character.historic}</p>
        <div className="main-stats">
          <StatBlock label="CA" value={character.ac} />
          <HPBar
            currentHP={character.currentHP}
            maxHP={character.maxHP}
          />
        </div>
      </div>

      <AbilityScores stats={character.stats} />

      <div className="proficiencies">
        <p>Bonus de Maîtrise: +{character.proficiencyBonus}</p>
        {characterStats.spellAttackBonus !== null && (
          <p>Bonus d'attaque (sorts) : <span className="font-semibold">+{characterStats.spellAttackBonus}</span></p>
        )}
        <p>Bonus d'attaque (armes) : <span className="font-semibold">+{characterStats.weaponAttackBonus}</span></p>
      </div>

      <CollapsibleSection
        title="Compétences"
        isVisible={false}
        onToggle={() => {}}
      >
        <SkillsList
          character={character}
          getSaveBonus={getSaveBonus}
        />
      </CollapsibleSection>
    </div>
  )
}

export default CharacterSheet