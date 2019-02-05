Feature: Default menu displays for pages

  Scenario: Visit Retention Report
    Given I am logged in to the system
    And I view the Retention Week / Week report
    Then the "dev,release" channels should be checked
    And the ref select should be visible and have no ref entered
    And the this month button should "not" be visible

 Scenario: Visit the Monthly Active Users by Platform Report
   Given I am logged in to the system
   And I view the Monthly Active Users by Platform report
   Then the "dev,release" channels should be checked
   And the ref select should not be visible
   And the this month button should "not" be visible
