Feature: Manual Page
  The manual page shows game rules and instructions with all child components

  Scenario: Manual page renders all sections and components
    Given I am on the manual page
    Then I should see the manual title "FLIP7"
    And I should see "HOW TO PLAY" section
    And I should see "THE FLIP7 DECK" section
    And I should see "SCORING SYSTEM" section
    And I should see "SPECIAL CARDS" section
    And I should see "HOW TO WIN" section
    And I should see the back button
    And I should see manual section components
    And I should see rule card components
    And I should see game card components
    And I should see the victory panel
    And I should see the manual stats

  Scenario: Navigate back from Manual
    Given I am on the manual page
    When I click the back button
    Then I should be on the main menu page
