/// <reference types="cypress" />

// https://github.com/bahmutov/cypress-network-idle
import 'cypress-network-idle'

const getIframeBody = (wrap = false) => {
  if (wrap) {
    return (
      cy
        .get('iframe[title="Frame of demo shop"]')
        .its('0.contentDocument.body')
        // we know the iframe body is there
        // but we need a jQuery object to be able to use cy.contains
        // otherwise we see "subject.each" is not a function error
        .then(cy.wrap)
    )
  } else {
    return cy
      .get('iframe[title="Frame of demo shop"]')
      .its('0.contentDocument.body')
  }
}

it('goes to the checkout with one item', () => {
  cy.visit('/')
  cy.get('#loadingMessage', { timeout: 15_000 }).should('not.be.visible')
  getIframeBody()
    .find('.header-top')
    .should('be.visible')
    .contains('a', 'Clothes')
    .click()
  getIframeBody().find('.breadcrumb').should('include.text', 'Clothes')
  getIframeBody(true).contains('.category-sub-menu a', 'Men').click()
  getIframeBody().find('.breadcrumb').should('include.text', 'Men')

  cy.waitForNetworkIdlePrepare({
    method: 'GET',
    pattern: '*.js',
    alias: 'js',
  })

  // click on the first product item
  getIframeBody()
    .find('.products .product')
    .should('have.length.greaterThan', 0)
    .first()
    .click()

  // click on the "Add to cart" button
  getIframeBody()
    .find('#main .product-container')
    .should('be.visible')
    .within(() => {
      cy.waitForNetworkIdle('@js', 40)
      cy.contains('.product-add-to-cart', 'Add to cart')
      cy.contains('button', 'Add to cart').should('be.visible').click()
    })

  getIframeBody()
    .find('#blockcart-modal')
    .should('be.visible')
    .contains('a', 'Proceed to checkout')
    .click()

  getIframeBody()
    .find('.cart-grid')
    .should('be.visible')
    .contains('a', 'Proceed to checkout')
    .click()

  getIframeBody()
    .find('#checkout-personal-information-step')
    .should('be.visible')
})
