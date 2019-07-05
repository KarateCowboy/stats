Feature: a report that shows the ratios of crashes

  Scenario: View the report
    Given I am logged in to the system
    And there is crash ratio data for the last forty days
    And I view the Crash Ratios report
    Then I should see the crash ratios chart and table for the last forty days


