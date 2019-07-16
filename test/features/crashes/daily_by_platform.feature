Feature: Daily Crashes by Platform report

  Scenario: View the report
    Given I am logged in to the system
    And there are crashes for the last three weeks
    And I view the Daily Crashes by Platform report
    Then I should see the total crashes for each day grouped by platform
