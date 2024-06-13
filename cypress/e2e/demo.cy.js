describe('Demo page', () => {
    it('visits the demo page', () => {
        cy.visit('/demo');
        cy.contains('This is just another view')
    });
});
