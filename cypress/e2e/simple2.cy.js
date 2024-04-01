/// <reference types="cypress" />

// https://github.com/bahmutov/cypress-network-idle
import 'cypress-network-idle'

const iframeBody = () =>
  cy.get('iframe[title="Frame of demo shop"]').its('0.contentDocument.body')

const iframeFind = (selector) => iframeBody().find(selector)

const iframeContains = (selector, text) =>
  iframeBody()
    // we know the iframe body is there
    // but we need a jQuery object to be able to use cy.contains
    // otherwise we see "subject.each" is not a function error
    .then(cy.wrap)
    .contains(selector, text)

it('goes to the checkout with one item', () => {
  cy.visit('/')
  cy.get('#loadingMessage', { timeout: 15_000 }).should('not.be.visible')
  iframeFind('.header-top')
    .should('be.visible')
    .contains('a', 'Clothes')
    .click()
  iframeFind('.breadcrumb').should('include.text', 'Clothes')
  iframeContains('.category-sub-menu a', 'Men').click()
  iframeFind('.breadcrumb').should('include.text', 'Men')

  cy.waitForNetworkIdlePrepare({
    method: 'GET',
    pattern: '*.js',
    alias: 'js',
  })

  // click on the first product item
  iframeFind('.products .product')
    .should('have.length.greaterThan', 0)
    .first()
    .click()

  // click on the "Add to cart" button
  iframeFind('#main .product-container')
    .should('be.visible')
    .within(() => {
      cy.waitForNetworkIdle('@js', 40)
      cy.contains('.product-add-to-cart', 'Add to cart')
      cy.contains('button', 'Add to cart').should('be.visible').click()
    })

  iframeFind('#blockcart-modal')
    .should('be.visible')
    .contains('a', 'Proceed to checkout')
    .click()

  iframeFind('.cart-grid')
    .should('be.visible')
    .contains('a', 'Proceed to checkout')
    .click()

  iframeFind('#checkout-personal-information-step').should('be.visible')
})
