Feature: Line graph showing daily aggregation of publisher signups

Scenario: View aggregation trends in publishers
  Given I am logged in to the system
  And there is recent data for aggregate publisher signups
  And I view the Daily Publishers Agg report
  Then I should see the aggregate daily publisher signup data in the report
