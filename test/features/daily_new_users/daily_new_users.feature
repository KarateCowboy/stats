Feature: Daily New Users Aggregate Report


  Scenario: View the report
    Given I am logged in to the system
    And there are new user records for the last three weeks
    And I view the Daily New Users report
    Then I should see the Daily New Users report
    And I should see the Daily New Users chart

  @dev
  Scenario Outline: Filter by channel
    Given I am logged in to the system
    And there are new user records for the last two months, across all channels
    And I view the Daily New Users report
    When I filter by channel <channel>
    Then I should see data in the Daily New Users table updated to match the <channel> channel

    Examples:
      | channel |
      | nightly |
      | dev     |
      | beta    |

