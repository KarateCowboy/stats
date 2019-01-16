Feature: Daily New Users Aggregate Report


  Scenario: View the report
    Given I am logged in to the system
    And there are new user records for the last three weeks
    And I view the Daily New Users report
    Then I should see the Daily New Users report
    And I should see the Daily New Users chart
