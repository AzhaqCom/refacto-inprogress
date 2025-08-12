import React, { useState } from 'react'
import { useGameStore, useCharacterStore } from '../../../stores'
import { characterTemplates } from '../../../data/characterTemplates'
import CharacterSelectionCard from './CharacterSelectionCard'

/**
 * Écran de sélection de personnage modernisé
 */
const CharacterSelection = ({ onCharacterSelect }) => {
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  
  const setGamePhase = useGameStore(state => state.setGamePhase)
  const setPlayerCharacter = useCharacterStore(state => state.setPlayerCharacter)

  // Personnages disponibles (peut être étendu dynamiquement)
  const availableCharacters = [
    characterTemplates.wizard,
    characterTemplates.warrior, 
    characterTemplates.rogue
  ].filter(Boolean) // Filtrer les personnages undefined

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character)
  }

  const handleConfirmSelection = () => {
    if (!selectedCharacter) return

    // Initialiser le personnage dans le store
    setPlayerCharacter(selectedCharacter)
    
    // Callback externe si fourni
    onCharacterSelect?.(selectedCharacter)
    
    // Changer de phase de jeu
    setGamePhase('game')
  }

  const getCharacterDescription = (character) => {
    const descriptions = {
      'Magicien': "Maître des arcanes, ce personnage utilise des sorts puissants pour vaincre ses ennemis. Fragile mais redoutable à distance, il excelle dans le contrôle du champ de bataille.",
      'Guerrier': "Combattant expérimenté, ce héros excelle au corps-à-corps avec ses armes. Robuste et polyvalent au combat, il peut encaisser et infliger de lourds dégâts.",
      'Roublard': "Expert en furtivité, ce personnage frappe avec précision et évite les coups. Agile et mortel par surprise, il excelle dans les situations qui demandent de la finesse."
    }
    
    return descriptions[character.class] || "Un aventurier prêt à affronter tous les défis."
  }

  const getClassIcon = (characterClass) => {
    const icons = {
      'Magicien': '🧙‍♂️',
      'Guerrier': '⚔️',
      'Roublard': '🗡️'
    }
    
    return icons[characterClass] || '🗡️'
  }

  return (
    <div className="character-selection">
      <div className="character-selection__header">
        <h1 className="character-selection__title">
          ✨ Choisis ton Héros ✨
        </h1>
        <p className="character-selection__subtitle">
          Sélectionne le personnage avec lequel tu veux vivre cette aventure épique !
        </p>
      </div>

      <div className="character-selection__grid">
        {availableCharacters.map((character, index) => (
          <CharacterSelectionCard
            key={`${character.name}-${index}`}
            character={character}
            isSelected={selectedCharacter?.name === character.name}
            onSelect={handleCharacterSelect}
          />
        ))}
      </div>

      {selectedCharacter && (
        <div className="character-selection__confirmation">
          <h3>À propos de {selectedCharacter.name}</h3>
          <p>{getCharacterDescription(selectedCharacter)}</p>
          
          <div className="character-stats-detailed">
            <div className="stats-column">
              <h4>Caractéristiques</h4>
              <ul>
                <li>Force: {selectedCharacter.stats.force}</li>
                <li>Dextérité: {selectedCharacter.stats.dexterite}</li>
                <li>Constitution: {selectedCharacter.stats.constitution}</li>
                <li>Intelligence: {selectedCharacter.stats.intelligence}</li>
                <li>Sagesse: {selectedCharacter.stats.sagesse}</li>
                <li>Charisme: {selectedCharacter.stats.charisme}</li>
              </ul>
            </div>
            
            <div className="equipment-column">
              <h4>Équipement</h4>
              <ul>
                {selectedCharacter.weapons?.map((weapon, idx) => (
                  <li key={idx}>🗡️ {weapon}</li>
                ))}
                {selectedCharacter.spellcasting?.cantrips?.map((spell, idx) => (
                  <li key={idx}>✨ {spell}</li>
                ))}
              </ul>
            </div>
          </div>

          <button 
            className="confirm-selection-btn"
            onClick={handleConfirmSelection}
          >
            Commencer l'Aventure avec {selectedCharacter.name}
          </button>
        </div>
      )}
    </div>
  )
}

export default CharacterSelection