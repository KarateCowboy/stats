const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')

class MonthlyReturningUsersByPlatform extends BaseReportComponent {
    constructor() {
        super()
        this.title = 'Monthly Returning Users by Platform (MRU)'
        this.subtitle = ''
        this.path = 'usage_month_returning_platform'
        this.menuTitle = 'Monthly Returning Users by Platform - MRU'
        this.menuId = 'usageMonthReturningPlatform'
        this.reportContent = `<marquee>Monthly Returning Users Content</marquee>`
        this.contentTagId = 'usageContent'
        this.menuConfig.showWOISFilter = false
        this.menuConfig.showCountryCodeFilter = false
    }

    async retriever() {
        let results
        try {
            results = await $.ajax('/api/1/mru_platform?' + $.param(this.app.pageState.standardParams()))
            this.handler(results)
        } catch (e) {
            console.log(`Error running retriever for ${this.title}`)
            console.log(e.message)
        }
    }

    handler(data) {
        const handler = BaseReportComponent.buildSuccessHandler('ymd', 'platform', 'Month', 'Platform', {colourBy: 'label', pivot: true})
        handler(data)
        $(`#${this.contentTagId}`).show()
    }
}

module.exports = MonthlyReturningUsersByPlatform
