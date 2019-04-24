Feature: Line graph showing daily progress of publishers

Scenario: View increasing trends in publishers
  Given I am logged in to the system
  And there is recent data for publisher totals
  And I view the Daily Publishers report
  Then I should see the chart and table for the Daily Publishers report
