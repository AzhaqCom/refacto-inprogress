import React, { useEffect } from 'react';
import { useGameStore, useCharacterStore, useUIStore, gameSelectors, characterSelectors } from './stores';
import { CharacterSelection } from './components/features/character';
import { CombatPanel } from './components/features/combat';
import { RestPanel } from './components/features/rest';
import { InventoryPanel } from './components/features/inventory';
import { SpellPanel } from './components/features/spells';
import { CharacterSheet } from './components/features/character';
import { CombatLog, NotificationContainer, GlobalLoading } from './components/ui';
import { CompanionDisplay } from './components/combat/CompanionDisplay';
import { WeaponPanel } from './components/inventory/WeaponPanel';
import { SpecialAbilitiesPanel } from './components/character/SpecialAbilitiesPanel';
import { Scene } from './components/game/Scene';
import { scenes } from './data/scenes';
import { processSceneAction } from './components/utils/sceneUtils';
import './App.css';

function App() {
  // Stores Zustand
  const gamePhase = useGameStore(state => state.gamePhase);
  const currentScene = useGameStore(state => state.currentScene);
  const isResting = useGameStore(gameSelectors.isResting);
  const isInCombat = useGameStore(gameSelectors.isInCombat);
  const combatLog = useGameStore(state => state.combatLog);
  
  const playerCharacter = useCharacterStore(characterSelectors.getPlayerCharacter);
  const playerCompanion = useCharacterStore(characterSelectors.getPlayerCompanion);
  const setPlayerCharacter = useCharacterStore(state => state.setPlayerCharacter);
  const setPlayerCompanion = useCharacterStore(state => state.setPlayerCompanion);
  
  const isMobile = useUIStore(state => state.isMobile);
  const sidebarCollapsed = useUIStore(state => state.sidebarCollapsed);

  // Actions des stores
  const setGamePhase = useGameStore(state => state.setGamePhase);
  const setCurrentScene = useGameStore(state => state.setCurrentScene);
  const addCombatMessage = useGameStore(state => state.addCombatMessage);
  const addExperience = useCharacterStore(state => state.addExperience);
  const longRestAll = useCharacterStore(state => state.longRestAll);
  const shortRestPlayer = useCharacterStore(state => state.shortRestPlayer);
  const addItemToInventory = useCharacterStore(state => state.addItemToInventory);

  // Gestion d'erreur globale
  useEffect(() => {
    const handleError = (error) => {
      console.error('Erreur globale:', error);
      addCombatMessage(`Erreur: ${error.message}`, 'error');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => {
      handleError(new Error(event.reason));
    });

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, [addCombatMessage]);

  // Gestionnaire de sélection de personnage
  const handleCharacterSelect = (selectedCharacter) => {
    setPlayerCharacter(selectedCharacter);
    setGamePhase('game');
  };

  // Gestionnaire d'actions de scène
  const handleSceneAction = (nextAction) => {
    const action = typeof nextAction === 'function' ? nextAction() : nextAction;

    const result = processSceneAction(action, {
      startLongRest: (nextScene) => {
        useGameStore.getState().startLongRest(nextScene);
      },
      startShortRest: (nextScene) => {
        useGameStore.getState().startShortRest(nextScene);
      },
      handleItemGain: (items) => {
        const itemsToProcess = Array.isArray(items) ? items : [items];
        itemsToProcess.forEach(item => {
          addItemToInventory(item);
          addCombatMessage(`Tu as trouvé ${item} !`, 'bag');
        });
      },
      setPlayerCompanion,
      addCombatMessage,
      handleSkillCheck: (skill, dc, onSuccess, onPartialSuccess, onFailure) => {
        useGameStore.getState().handleSkillCheck(
          skill, dc, onSuccess, onPartialSuccess, onFailure, playerCharacter
        );
      }
    });

    if (result) {
      setCurrentScene(result);
    }
  };

  // Gestionnaire de fin de combat
  const handleCombatEnd = (encounterData) => {
    // Calculer l'XP gagné
    if (encounterData?.enemies) {
      const totalXP = encounterData.enemies.reduce((sum, enemy) => {
        const xpValues = { gobelin: 50, squelette: 50, diablotin: 200, diable: 450, mephiteBoueux: 50, kobold: 25, goule: 200 };
        return sum + (xpValues[enemy.type] || 100) * enemy.count;
      }, 0);
      
      if (totalXP > 0) {
        addExperience(totalXP);
        addCombatMessage(`Tu as gagné ${totalXP} points d'expérience !`, 'experience');
      }
    }

    // Retourner à la scène suivante
    const nextScene = encounterData?.next || currentScene;
    setCurrentScene(nextScene);
  };

  // Gestionnaire de repos terminé
  const handleRestComplete = (restType) => {
    if (restType === 'long') {
      longRestAll();
      addCombatMessage('Repos long terminé ! Toutes vos ressources ont été restaurées.', 'heal');
    } else {
      // Le repos court est géré par les actions individuelles
      addCombatMessage('Repos court terminé.', 'heal');
    }
    
    const nextScene = useGameStore.getState().nextSceneAfterRest;
    if (nextScene) {
      setCurrentScene(nextScene);
      useGameStore.getState().endShortRest();
    }
  };

  // Affichage conditionnel selon la phase de jeu
  if (gamePhase === 'character-selection') {
    return <CharacterSelection onCharacterSelect={handleCharacterSelect} />;
  }

  if (!playerCharacter) {
    return (
      <div className="game-container">
        <div className="main-content">
          <div className="loading-state">
            <h3>Chargement de votre personnage...</h3>
            <p>Préparation de l'aventure en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  // Déterminer les classes CSS selon le contexte
  const containerClass = `game-container ${isInCombat ? 'combat-mode' : ''}`;
  const mainContentClass = `main-content ${isInCombat ? 'combat-mode' : ''}`;
  const sidebarClass = `sidebar ${isMobile && sidebarCollapsed ? 'sidebar--collapsed' : ''}`;

  // Rendu du contenu principal selon l'état du jeu
  const renderMainContent = () => {
    // Repos en cours
    if (isResting) {
      return (
        <div className="rest-container">
          <RestPanel onRestComplete={handleRestComplete} />
          <CombatLog />
        </div>
      );
    }

    // Combat en cours
    if (isInCombat) {
      return (
        <CombatPanel
          playerCharacter={playerCharacter}
          playerCompanion={playerCompanion}
          encounterData={currentScene}
          onCombatEnd={handleCombatEnd}
          onReplayCombat={() => {
            // Reset du combat via les stores
            useCharacterStore.getState().longRestAll();
            useGameStore.getState().clearCombatLog();
            useGameStore.getState().incrementCombatKey();
          }}
        />
      );
    }

    // Scène textuelle normale
    const currentSceneData = scenes[currentScene];
    if (currentSceneData) {
      return (
        <div className="scene-textuel">
          <Scene
            text={currentSceneData.text}
            choices={currentSceneData.choices}
            onChoice={handleSceneAction}
          />
          <CombatLog />
        </div>
      );
    }

    // Fin de jeu
    return (
      <div className="game-end">
        <h2>Fin de l'aventure</h2>
        <p>Félicitations ! Vous avez terminé cette aventure.</p>
        <button onClick={() => setGamePhase('character-selection')}>
          Recommencer avec un nouveau personnage
        </button>
      </div>
    );
  };

  // Déterminer quels panneaux afficher dans la sidebar
  const shouldShowSpellcasting = playerCharacter?.spellcasting;
  const shouldShowWeapons = playerCharacter?.weapons && playerCharacter.weapons.length > 0;
  const shouldShowSpecialAbilities = playerCharacter?.specialAbilities;

  return (
    <div className={containerClass}>
      {/* Chargement global */}
      <GlobalLoading />
      
      {/* Notifications */}
      <NotificationContainer position="top-right" />

      {/* Contenu principal */}
      <div className={mainContentClass}>
        {renderMainContent()}
      </div>

      {/* Sidebar droite */}
      <div className={sidebarClass}>
        {/* Fiche de personnage */}
        <CharacterSheet characterType="player" />

        {/* Affichage du compagnon */}
        {playerCompanion && (
          <CompanionDisplay companion={playerCompanion} />
        )}

        {/* Inventaire */}
        <InventoryPanel />

        {/* Sorts (si le personnage peut en lancer) */}
        {shouldShowSpellcasting && (
          <SpellPanel />
        )}

        {/* Armes (si le personnage en a) */}
        {shouldShowWeapons && (
          <WeaponPanel character={playerCharacter} />
        )}

        {/* Capacités spéciales */}
        {shouldShowSpecialAbilities && (
          <SpecialAbilitiesPanel character={playerCharacter} />
        )}
      </div>
    </div>
  );
}

export default App;