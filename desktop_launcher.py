"""
Launcher desktop do FinTrack.

Roda o backend FastAPI (uvicorn) em segundo plano e abre a interface
numa janela nativa (sem barra de endereço, sem abas) usando pywebview -
a mesma técnica usada por apps como Spotify e VS Code.

Coloque este arquivo na RAIZ do projeto, ao lado de run.py.
"""
import os
import socket
import sys
import threading
import time
import traceback

import uvicorn
import webview

# Garante que "backend.app.main" seja importável mesmo rodando de outro
# diretório (ex: quando o .exe é aberto por um atalho na área de trabalho)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

HOST = "127.0.0.1"
PORT = 8000

# Guarda o erro real da thread do servidor, se houver, para exibirmos
# em vez de só um timeout genérico.
server_error = None


def run_server():
    """Sobe o FastAPI/uvicorn nesta thread, sem reload (reload não funciona em thread)."""
    global server_error
    try:
        from backend.app.main import app

        config = uvicorn.Config(app, host=HOST, port=PORT, log_level="warning")
        server = uvicorn.Server(config)
        server.run()
    except Exception:
        server_error = traceback.format_exc()


def wait_for_server(host, port, timeout=20):
    """Espera o servidor aceitar conexões antes de abrir a janela."""
    start = time.time()
    while time.time() - start < timeout:
        if server_error:
            return False
        try:
            with socket.create_connection((host, port), timeout=0.5):
                return True
        except OSError:
            time.sleep(0.2)
    return False


if __name__ == "__main__":
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()

    if not wait_for_server(HOST, PORT):
        print("=" * 60)
        if server_error:
            print("O servidor encontrou um erro ao iniciar:\n")
            print(server_error)
        else:
            print(
                "O servidor não respondeu a tempo (timeout), mas não "
                "levantou nenhuma exceção capturada."
            )
        print("=" * 60)
        input("\nPressione ENTER para fechar...")
        sys.exit(1)

    webview.create_window(
        "FinTrack",
        f"http://{HOST}:{PORT}/",
        width=1200,
        height=800,
        min_size=(900, 600),
    )
    webview.start()