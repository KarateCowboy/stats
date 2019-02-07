Feature: Daily New Users Aggregate Report


  Scenario: View the report
    Given I am logged in to the system
    And there are new user records for the last three weeks
    And I view the Daily New Users report
    Then I should see the Daily New Users report
    And I should see the Daily New Users chart

    @dev
  Scenario: Filter by campaign
    Given I am logged in to the system
    And there are new user records for the last two months, across several campaigns
    And I view the Daily New Users report
    When I filter Daily New Users by an existing campaign
    Then I should see data in the Daily New Users table updated to match the campaign filter

