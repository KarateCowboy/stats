Feature: Weekly Retention Report

  Scenario: View downloads over last week
    Given I am logged in to the system
    And there are osx downloads for the last twelve weeks
    And there are osx usages for the last twelve weeks
    And I view the Retention Week / Week report
