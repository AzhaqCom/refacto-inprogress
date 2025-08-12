import React, { useMemo, useState } from 'react'
import { useCharacterStore } from '../../../stores/characterStore'
import { useGameStore } from '../../../stores/gameStore'
import { CollapsibleSection } from '../../ui/CollapsibleSection'
import { InventoryItem } from '../../inventory/InventoryItem'

/**
 * Panneau d'inventaire moderne avec gestion Zustand
 */
const InventoryPanel = ({
  className = ''
}) => {
  // Stores
  const playerCharacter = useCharacterStore(state => state.playerCharacter)
  const useItem = useCharacterStore(state => state.useItem)
  
  const { addCombatMessage } = useGameStore()
  
  // État local
  const [inventoryVisible, setInventoryVisible] = useState(false)

  const characterInventory = playerCharacter?.inventory || []

  // Gestionnaires d'événements
  const handleUseItem = (item) => {
    if (useItem) {
      useItem(item.id || item.name);
    }
  }

  const inventoryItems = useMemo(() => {
    if (characterInventory.length === 0) {
      return <li>Ton inventaire est vide.</li>
    }

    return characterInventory.map((item) => (
      <InventoryItem 
        key={item.id} 
        item={item} 
        onUseItem={handleUseItem} 
      />
    ))
  }, [characterInventory, handleUseItem])

  if (!playerCharacter) {
    return null
  }

  return (
    <div className="inventory">
      <CollapsibleSection
        title="Inventaire"
        isVisible={inventoryVisible}
        onToggle={() => setInventoryVisible(!inventoryVisible)}
      >
        <ul>
          {inventoryItems}
        </ul>
      </CollapsibleSection>
    </div>
  )
}

export default InventoryPanel