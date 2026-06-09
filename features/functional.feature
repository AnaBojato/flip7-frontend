Feature: Functional Game Scenarios
  Complete end-to-end functional tests covering core Flip7 game mechanics

  Scenario: Normal Round - Card dealing, turns, scoring
    Given I create a game and navigate to it
    Then each player should have at least one card dealt
    When I play through a normal round with draws and stands
    Then I should see the round summary modal
    And the round summary should show correct scores

  Scenario: Everyone Loses - All players bust from duplicate cards
    Given I create a game and navigate to it
    When all players draw cards until the round ends
    Then I should see the round summary modal
    And all players should have finished the round
