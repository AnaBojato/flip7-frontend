Feature: Players Page
  The players page allows configuring and starting a game

  Scenario: Players page renders
    Given I am on the players page
    Then I should see "ASSEMBLE YOUR CREW"
    And I should see the player slider
    And I should see the "SET SAIL" button
    And I should see the "ABANDON SHIP" button

  Scenario: Slider changes player count
    Given I am on the players page
    When I change the player count to 4
    Then I should see 4 player cards
    When I change the player count to 8
    Then I should see 8 player cards

  Scenario: Navigate back to main menu
    Given I am on the players page
    When I click "ABANDON SHIP"
    Then I should be on the main menu page

  Scenario: Create game with players
    Given I am on the players page
    When I fill player names for all players
    And I click "SET SAIL"
    Then I should be on the game page

  Scenario: Alert on empty names
    Given I am on the players page
    When I click SET SAIL without filling names
    Then I should be on the players page
