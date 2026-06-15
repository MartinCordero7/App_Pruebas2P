describe("Reportes Gerenciales", () => {

    beforeEach(() => {
        cy.login();
        cy.visit("http://localhost:5173/reports");
    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE APROBACIÓN
    // ────────────────────────────────────────────

    it("[APROBACIÓN] Muestra el título de la página", () => {

        cy.contains("Reportes Gerenciales")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra los botones de exportación (Excel y PDF)", () => {

        cy.contains("Excel").should("exist");
        cy.contains("PDF").should("exist");

    });

    it("[APROBACIÓN] Muestra el selector de tipo de reporte", () => {

        cy.get("select")
            .first()
            .should("exist");

    });

    it("[APROBACIÓN] Muestra el reporte de Morosidad por defecto", () => {

        cy.contains("Deuda Total").should("exist");
        cy.contains("Residentes Morosos").should("exist");

    });

    it("[APROBACIÓN] Cambia al reporte Financiero correctamente", () => {

        cy.get("select").first().select("financiero");

        // Esperar a que cargue el reporte financiero
        cy.contains("Ingresos Totales").should("exist");

    });

    it("[APROBACIÓN] Cambia al reporte de Flujo de Caja", () => {

        cy.get("select").first().select("flujo");

        cy.contains("Flujo de Caja Mensual")
            .should("exist");

    });

    it("[APROBACIÓN] Cambia al reporte de Indicadores KPI", () => {

        cy.get("select").first().select("kpis");

        cy.contains("Ocupación de Unidades")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra el selector de Mes", () => {

        // Hay dos selects: tipo de reporte y mes
        cy.get("select").should("have.length.at.least", 2);

    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE FALLO
    // ────────────────────────────────────────────

    it("[FALLO] Redirige al login si no hay sesión activa", () => {

        cy.clearLocalStorage();
        cy.visit("http://localhost:5173/reports");

        cy.url()
            .should("include", "/login");

    });

    it("[FALLO] No muestra datos del reporte financiero sin sesión válida", () => {

        cy.clearLocalStorage();
        cy.visit("http://localhost:5173/reports");

        // Debe redirigir al login y no mostrar datos sensibles
        cy.url().should("include", "/login");
        cy.contains("Ingresos Totales").should("not.exist");

    });

});
