describe('Home page', () => {
    it('visits the app root url', () => {
        cy.visit('/');
        cy
            .contains('This is home')
            .contains('Nothing to see here');
    });
});
