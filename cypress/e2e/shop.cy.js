/// <reference types="cypress" />

// https://github.com/bahmutov/cypress-network-idle
import 'cypress-network-idle'

it('goes to the checkout with one item', () => {
  cy.visit('/')
  cy.get('#loadingMessage', { timeout: 15_000 }).should('not.be.visible')
  cy.get('iframe[title="Frame of demo shop"]')
    .its('0.contentDocument.body')
    .find('.header-top')
    .should('be.visible')
    .contains('a', 'Clothes')
    .click()
  cy.get('iframe[title="Frame of demo shop"]')
    .its('0.contentDocument.body')
    .find('.breadcrumb')
    .should('include.text', 'Clothes')
  cy.get('iframe[title="Frame of demo shop"]')
    .its('0.contentDocument.body')
    // we know the iframe body is there
    // but we need a jQuery object to be able to use cy.contains
    // otherwise we see "subject.each" is not a function error
    .then(cy.wrap)
    .contains('.category-sub-menu a', 'Men')
    .click()
  cy.get('iframe[title="Frame of demo shop"]')
    .its('0.contentDocument.body')
    .find('.breadcrumb')
    .should('include.text', 'Men')

  cy.waitForNetworkIdlePrepare({
    method: 'GET',
    pattern: '*.js',
    alias: 'js',
  })

  // click on the first product item
  cy.get('iframe[title="Frame of demo shop"]')
    .its('0.contentDocument.body')
    .find('.products .product')
    .should('have.length.greaterThan', 0)
    .first()
    .click()

  // click on the "Add to cart" button
  cy.get('iframe[title="Frame of demo shop"]')
    .its('0.contentDocument.body')
    .find('#main .product-container')
    .should('be.visible')
    .within(() => {
      cy.waitForNetworkIdle('@js', 40)
      cy.contains('.product-add-to-cart', 'Add to cart')
      cy.contains('button', 'Add to cart').should('be.visible').click()
    })

  cy.get('iframe[title="Frame of demo shop"]')
    .its('0.contentDocument.body')
    .find('#blockcart-modal')
    .should('be.visible')
})
