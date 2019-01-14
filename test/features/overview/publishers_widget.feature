Feature: Publishers information on Overview page

  Scenario: View with normal information
    Given I am logged in to the system
    And there is recent data for publisher totals
    And I view the Overview page
    Then I should see the publishers table with row headings and data
    And I should see the channels table with column headings and data
