Feature: a report that shows the ratios of crashes

  Scenario: View the report
    Given I am logged in to the system
    And there is crash ratio data for the last forty days
    When I view the Top Crash Reasons report
    Then I should see the Top Crash Reasons report with some numbers
