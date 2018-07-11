Feature: Monthly Active Users by Platform (MAU)

  Scenario: Winx64 Brave core usage
    Given I am logged in to the system
    And there are "100000" usages for the prior month
    And I view the Monthly Active Users by Platform report
    Then I should see the "100,000" MAU for the prior month on winx64-bc
