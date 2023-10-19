/* eslint-disable max-len */

import { db } from '@/firebase'
import {
  doc,
  updateDoc,
  getDoc,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  collection,
  orderBy,
  limit,
} from 'firebase/firestore'

/**
 * @typedef {Object} OrderBy
 * @property {string} field The field to be sorted.
 * @property {'asc'|'desc'} mode The sorting mode.
 */

/**
 * @typedef {'!='|'<'|'<='|'=='|'>'|'>='|'array-contains'|'array-contains-any'|'in'|'not-in'} Operator
 */

/**
 * @typedef {Object} Where
 * @property {string} field The field name to be used in the filtering.
 * @property {Operator} operator The operator to be used to compare the field with the value.
 * @property {any} value The value to be used on the comparison.
 */

/**
 * @typedef {Object} Query
 * @property {number} limit The amount of items to get.
 * @property {Where[]} where The filters to be applied.
 * @property {OrderBy[]} orderBy A list with all sorting fields.
 */

export default class Controller {
  // path - collection
  // data - document to insert (object)
  async create(col, payload) {
    return addDoc(collection(db, col), payload)
  }

  async readOne(col, docId) {
    const ref = doc(db, `${col}/${docId}`)

    return getDoc(ref)
  }

  async query(col, params) {
    const q = query(
      collection(db, col),
      where(params.field, params.condition, params.value),
    )

    return getDocs(q)
  }

  /**
   * Makes a query to get data from the database.
   *
   * @param {string} col the collection name.
   * @param {Query} constraints the query to be used.
   * @returns {Promise<any[]>} the found entities.
   */
  async queryCustom(col, constraints = {}) {
    const { orderBy: ob = [], where: wh = [], limit: lm = 0 } = constraints

    const q = query(
      collection(col),
      ...ob.map((o) => orderBy(o.field, o.mode)),
      ...wh.map((w) => where(w.field, w.operator, w.value)),
      limit(lm),
    )

    const snap = await getDocs(q)

    return snap.docs.map((document) => ({
      ...document.data(),
      id: document.id,
    }))
  }

  /**
   * Gets a document data by its id and collection.
   *
   * @param {string[]} path the document path to be accessed.
   * @throws a Firebase exception.
   */
  async getById(path) {
    // return getDoc(doc(db, ...path));
    const docRef = doc(db, path[0], path[1])
    return getDoc(docRef)
  }

  async readAll(path) {
    const q = query(collection(db, path))
    const querySnapshot = await getDocs(q)

    const res = []

    querySnapshot.forEach((document) => {
      res.push(Object.assign(document.data(), { id: document.id }))
    })

    return res
  }

  async update(col, docId, payload) {
    try {
      const ref = doc(db, `${col}/${docId}`)
      console.log('Update:', payload)
      return updateDoc(ref, payload)
    } catch(e) {
      console.log(e)
    }
  }

  async delete(col, docId) {
    return deleteDoc(doc(db, col, docId))
  }
}
