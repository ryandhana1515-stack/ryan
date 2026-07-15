def register_all() -> None:
    """Wire every workflow subscriber onto the event bus. Idempotent."""
    from app.workflows import lead_flow  # noqa: F401

    lead_flow.register()
