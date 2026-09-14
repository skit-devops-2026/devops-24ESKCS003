from app import app

def test_home_page():
    """Test that the home page loads successfully."""
    tester = app.test_client()
    response = tester.get('/')
    assert response.status_code == 200