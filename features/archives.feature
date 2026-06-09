Feature: Archives Page
  The archives page allows searching game history

  Scenario: Archives page renders with all elements
    Given I am on the archives page
    Then I should see "GRAND LINE RECORDS"
    And I should see the search input
    And I should see the "SEARCH" button
    And I should see the back button
    And I should see the empty state message
    And I should see the archive footer

  Scenario: Search with empty input
    Given I am on the archives page
    When I click the "SEARCH" button
    Then I should see an error message "Please enter a valid game ID."

  Scenario: Search with invalid text
    Given I am on the archives page
    When I type invalid text in the search input
    And I click the "SEARCH" button
    Then I should see an error message "Please enter a valid game ID."

  Scenario: Navigate back from Archives
    Given I am on the archives page
    When I click the back button
    Then I should be on the main menu page

  Scenario: Game not found
    Given I am on the archives page
    When I type "999" in the search input
    And I click the "SEARCH" button
    Then I should see an error message "No game found with that ID."

  Scenario: Search for a valid game
    Given I create a game via API
    And I am on the archives page
    When I type the created game ID in the search input
    And I click the "SEARCH" button
    Then I should see the round history
    And I should see the top 3 podium

  Scenario: Press Enter to search
    Given I create a game via API
    And I am on the archives page
    When I type the created game ID in the search input
    And I press Enter
    Then I should see the round history
