const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')

class MonthlyActiveUsersByPlatform extends BaseReportComponent {
    constructor() {
        super()
        this.title = 'Monthly Active Users by Platform (MAU)'
        this.subtitle = ''
        this.path = 'usage_month'
        this.menuTitle = 'Monthly Active Users by Platform - MAU'
        this.menuId = 'usageMonth'
        this.reportContent = `<marquee>Monthly Active Users Content</marquee>`
        this.contentTagId = 'usageContent'
        this.csvFilename = 'monthly-active-users-by-platform'
        this.csvDownloadable = true
        this.menuConfig.showWOISFilter = false
        this.menuConfig.showCountryCodeFilter = false
    }

    async retriever() {
        let results
        try {
            results = await $.ajax('/api/1/mau_platform?' + $.param(this.app.pageState.standardParams()))
            this.handler(results)
        } catch (e) {
            console.log(`Error running retriever for ${this.title}`)
            console.log(e.message)
        }
    }

    handler(data) {
        const handler = BaseReportComponent.buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {colourBy: 'label', pivot: true})
        const results = handler(data)
        this.csvData = results.csv
        $(`#${this.contentTagId}`).show()
    }
}

module.exports = MonthlyActiveUsersByPlatform
