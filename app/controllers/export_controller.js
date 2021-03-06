class ExportController {

  constructor () {
    // TODO: Detect connected tab
    if (App.currentTab.instance.type != "db_screen") {
      throw new Error("Please connecto to database");
    }

    Object.defineProperty(this, "handler", {
      get: function () {
        return App.currentTab.instance;
      }
    });

  }

  doExport () {
    this.dialog = new Dialog.ExportFile(this.handler, (filename, options) => {
      this.runPgDump(filename, options);
    });
  }

  runPgDump (filename, options) {
    var exporter = new SqlExporter({debug: false});

    if (options.exportData === false) {
      exporter.setOnlyStructure();
    }

    if (options.exportStructure === false) {
      exporter.setOnlyData();
    }

    if (options.exportOwners === false) {
      exporter.setNoOwners();
    }

    this.dialog.startExporting();
    this.dialog.addMessage("Start exporting '" + this.handler.database + "'\n");

    exporter.onMessage((message, is_good) => {
      this.dialog.addMessage(message);
    });

    App.startLoading(`Saving dump to ${filename}`);
    exporter.doExport(this.handler.connection, filename, (success, result) => {
      App.stopLoading();
      this.dialog.addMessage(success ? "SUCCESS\n" : "FAILED\n");
      if (filename && success) {
        this.dialog.addMessage("Saved to file " + filename);
      }
      this.dialog.showCloseButton();
    });
  }

  currentTab () {
    return App.currentTab.instance;
  }
}

module.exports = ExportController;
