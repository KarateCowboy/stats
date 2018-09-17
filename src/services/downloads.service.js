
const { UAParser } = require('ua-parser-js')
module.exports = class DownloadsService {
  constructor (s3_instance) {
    this.S3 = s3_instance
    this.timestamp_format_string = 'DD/MMMM/YY:HH:mm:ss ZZ' 
  }

  async get_log_list (pagination_key) {
    const params = {
      Bucket: 'aa', //download_logs_bucket,
      // Prefix: `${key}/${prefix}`
      MaxKeys: 2000000000,
      Prefix: '2018'
    }
    if (!!pagination_key) {
      params.Key = pagination_key
    }
    const data = await this.S3.listObjects(params).promise() //, data, (err, data) => { if (err) return reject() resolve(data.Contents)
    this.current_list = data.Contents
    return data
  }

  async create (data) {
    await knex('dw.downloads').insert(data)
  }
  parse(line){
    const result = {}
    let sha = line.match(/[0-9a-z]{65,65}/)[0]
    result.sha = sha ? sha : null
    // const line = `608d9d664ad099538106571744f55ac449c1eb8dc08c08c114039011d43395954 brave-download [01/Jan/2018:02:02:03 +0000] 157.52.69.34 - 922A0961750A507F REST.GET.OBJECT multi-channel/releases/dev/0.19.123/winx64/BraveSetup-x64.exe "GET /multi-channel/releases/dev/0.19.123/winx64/BraveSetup-x64.exe HTTP/1.1" 304 - - 136855360 9 - "https://brave.com/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299" -`
    result.type = line.substring(66,80)
    result.timestamp = line.match(/[\d]{2,}\/[A-Za-z]{1,}\/[\d]{4,4}(:[\d]{2,})+\s{1,1}[+|-]{1,}[\d]{4,}/)[0]
    result.ip_address = line.match(/([\d]{1,3}\.){3,}[\d]{1,3}/)[0]
    result.id_code = line.match(/[A-Z0-9]{16,}/)[0]
    result.rest_operation = line.match(/(REST)(\.[A-Z]+){2,2}/)[0]
    result.request_path = line.match(/[\w-\/\.]{15,}(Brave)[\w-\/\.]+/)[0]
    result.request_string = line.match(/(GET) [\w-\/\.]{15,}(Brave)[\w-\/\.]+ (HTTP)\/[0-9\.]+/)[0]
    result.request_response_code = Number(line.match(/\s[0-9]{3,3}\s/)[0].replace(/\s/g,''))
    result.junk_number_1 = Number(line.match(/\b[\d]{9,9}\b/)[0])
    result.junk_number_2 = Number(line.match(/\b[\d]{9,9}\b/g)[1])
    result.junk_number_3 = Number(line.match(/\s[\d]{1,1}\s/g)[0].replace(/\s/g, ''))
    result.domain = line.match(/\b(https:\/\/)[a-z0-9\.\/]+\b/)[0]
    const ua_parser = new UAParser(line)
    result.browser_name = ua_parser.getBrowser().name
    // result.browser_signature = line.match(//)[0]
    //result.junk_number_4 = Number(line.match(/\s[\d]{1,1}\s/g)[1].replace(/\s/g, ''))
    return result
  }
}
