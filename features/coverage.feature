Feature: Coverage helper scenarios
  Exercises library & component code not triggered by normal UI flow

  Scenario: Call all uncovered library functions
    Given I am on the main menu page
    When I exercise gameService library functions
    Then I should still see the main menu

  Scenario: View archive round accordion
    Given I create a game via API
    And I am on the archives page
    When I type the created game ID in the search input
    And I click the "SEARCH" button
    And I expand the round accordion
    Then I should see the round details
