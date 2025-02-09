import sys
from PyQt6.QtWidgets import QApplication, QMainWindow
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtCore import QUrl


class WebApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.browser = QWebEngineView()
        self.browser.setUrl(QUrl("http://127.0.0.1:5000"))  # Convert string to QUrl
        self.setCentralWidget(self.browser)
        self.setGeometry(100, 100, 1280, 800)


app = QApplication(sys.argv)
window = WebApp()
window.show()
sys.exit(app.exec())
