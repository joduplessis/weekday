import PouchDB from 'pouchdb'
import { LOCAL_DB } from '../environment'
import { logger } from '../helpers/util'

export default class DatabaseService {
  static instance
  database

  constructor() {
    this.database = new PouchDB(LOCAL_DB)

    // Get DB info
    this.database.info().then(info => {
      logger('DB CONNECTED')
    })
  }

  unread(team, channel) {
    this.database
      .query(
        (doc, emit) => {
          emit([doc.team, doc.channel])
        },
        { key: [team, channel] }
      )
      .then(result => {
        const record = result.rows.flatten()

        // If it does exist, we want to update it
        if (record) {
          this.database.get(record.id).then(doc => {
            doc.count = parseInt(doc.count) + 1
            return this.database.put(doc)
          })
        }

        // If it does not, then we want to create it
        if (!record) {
          this.database
            .post({
              team,
              channel,
              count: 1,
            })
            .then(doc => {
              logger('CREATE DB ROW', doc)
            })
            .catch(err => {
              logger('DB ERROR', err)
            })
        }
      })
  }

  read(channel) {
    this.database
      .allDocs({ include_docs: true })
      .then(({ rows }) => {
        rows.map(row => {
          if (row.doc.channel == channel) {
            this.database
              .remove(row.doc)
              .catch(res => {
                logger('DB REMOVE', res)
              })
              .catch(err => {
                logger('DB ERROR', err)
              })
          }
        })
      })
      .catch(err => {
        logger('DB ERROR', err)
      })
  }

  static getInstance() {
    if (this.instance) return this.instance

    // Otherwise create one
    this.instance = new DatabaseService()

    // And return it
    return this.instance
  }
}

/**
 
  // Implementation - leaving it here for reference
  // Get unread count
  DatabaseService.getInstance()
    .database.allDocs({ include_docs: true })
    .then(({ rows }) => {
      dispatch(updateUnread(rows))
    })
    .catch(err => {
      dispatch(updateError('allDocs DB error'))
    })

  // If anything changes
  // Update the channels list
  DatabaseService.getInstance()
    .database.changes({
      live: true,
      since: 'now',
    })
    .on('change', docs => {
      DatabaseService.getInstance()
        .database.allDocs({ include_docs: true })
        .then(({ rows }) => {
          dispatch(updateUnread(rows))
        })
        .catch(err => {
          dispatch(updateError('allDocs DB error'))
        })
    })
    .on('error', err => {
      dispatch(updateError('allDocs DB error'))
    })

 */
