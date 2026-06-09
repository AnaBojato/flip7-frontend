Feature: Main Menu
  The main menu is the landing page of the application

  Scenario: Main menu renders with all elements
    Given I am on the main menu page
    Then I should see the main menu
    And I should see the FLIP7 logo
    And I should see the "NEW JOURNEY" button
    And I should see the "MARINE ARCHIVES" button
    And I should see the "MANUAL" button
    And I should see the edition stamp
    And I should see the star decorations

  Scenario: Navigate to Players page
    Given I am on the main menu page
    When I click "NEW JOURNEY"
    Then I should be on the players page

  Scenario: Navigate to Archives page
    Given I am on the main menu page
    When I click "MARINE ARCHIVES"
    Then I should be on the archives page

  Scenario: Navigate to Manual page
    Given I am on the main menu page
    When I click "MANUAL"
    Then I should be on the manual page
