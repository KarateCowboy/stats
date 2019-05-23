Feature: Channel totals on Overview report

Scenario: View the widget when data is present
  Given there is recent ChannelTotal data
  And I am logged in to the system
  And I view the Overview page
  Then I should see the channel totals for all included channels 
