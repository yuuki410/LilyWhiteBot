/*
 * From Zokhoi/SCPush/src/lib/crom.js
 */
const got = require('got');

/**
 * Interacter with Crom wiki crawler api.
 */
class CromApi {
  constructor() {
    this.base = `https://api.crom.avn.sh/graphql`
  }
  async req(query) {
    return await got.post(this.base, {
      json: {
        query: query.trim()
      }
    }).json()
  }

  async searchPages(query, filter) {
    return await this.req(`
      {
        searchPages(query: "${query}", filter: {
          anyBaseUrl: ${ !!filter && !!filter.anyBaseUrl ? `"${filter.anyBaseUrl}"` : null }
        }) {
          url
          wikidotInfo {
            title
            rating
          }
          alternateTitles {
            type
            title
          }
          translationOf {
            wikidotInfo {
              title
              rating
            }
          }
        }
      }
    `)
  }

  async searchUsers(query, filter) {
    return await this.req(`
      {
        searchUsers(query: "${query}", filter: {
          anyBaseUrl: ${ !!filter && !!filter.anyBaseUrl ? `"${filter.anyBaseUrl}"` : null }
        }) {
          name
          authorInfos {
            authorPage {
              url
            }
          }
          statistics${ !!filter && !!filter.baseUrl ? `(baseUrl: "${filter.baseUrl}")` : "" } {
            rank
            totalRating
            meanRating
            pageCount
          }
        }
      }
    `)
  }
  
  async searchUserByRank(rank, filter) {
    if (!(typeof rank == 'number') || isNaN(rank)) { throw new Error('Rank has to be an integer.'); }
    return await this.req(`
      {
        usersByRank(rank: ${rank}, filter: {
          anyBaseUrl: ${ !!filter && !!filter.anyBaseUrl ? `"${filter.anyBaseUrl}"` : null }
        }) {
          name
          authorInfos {
            authorPage {
              url
            }
          }
          statistics${ !!filter && !!filter.baseUrl ? `(baseUrl: "${filter.baseUrl}")` : "" } {
            rank
            totalRating
            meanRating
            pageCount
          }
        }
      }
    `)
  }
}

module.exports = CromApi;
