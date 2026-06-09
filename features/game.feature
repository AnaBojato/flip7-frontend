Feature: Game Page
  The game page is where the Flip7 game is played

  Scenario: Game page shows without game ID
    Given I navigate to the game page without a game ID
    Then I should see the game page header
    And I should see "FLIP7" in the header
    And I should see "Waiting..."
    And I should see round information

  Scenario: Game page renders with game ID and all elements
    Given I create a game and navigate to it
    Then I should see the game page header
    And I should see the deck
    And I should see the scoreboard
    And I should see round information
    And I should see player panels on the table
    And I should see the Draw button
    And I should see the Stand button
    And I should see the current turn player

  Scenario: Draw a card from the deck
    Given I create a game and navigate to it
    When I click the Draw button
    Then I should see a revealed card

  Scenario: Game header shows round number
    Given I create a game and navigate to it
    Then I should see round number 1

  Scenario: Scoreboard shows players
    Given I create a game and navigate to it
    Then I should see the scoreboard with player scores

  Scenario: Game ID chip is visible
    Given I create a game and navigate to it
    Then I should see the game ID chip

  Scenario: Player turn banner updates
    Given I create a game and navigate to it
    Then I should see the current turn player name

  Scenario: Scoreboard shows cards after initial deal
    Given I create a game and navigate to it
    Then I should see cards in the scoreboard


