from sqlalchemy import Column, String, Text
from app.config import get_settings

settings = get_settings()
_is_postgres = settings.DATABASE_URL.startswith("postgresql")


if _is_postgres:
    from geoalchemy2 import Geometry as _Geometry
    from sqlalchemy.dialects.postgresql import UUID as _UUID, ARRAY as _ARRAY

    def Geometry(geometry_type, srid=4326, nullable=True):
        return Column(_Geometry(geometry_type, srid=srid), nullable=nullable)

    def UUID(as_uuid=False):
        from sqlalchemy.dialects.postgresql import UUID as PGUUID
        return PGUUID(as_uuid=as_uuid)

    def Array(item_type):
        return _ARRAY(item_type)

else:
    def Geometry(geometry_type, srid=4326, nullable=True):
        return Column(Text, nullable=nullable)

    def UUID(as_uuid=False):
        import uuid as _uuid
        from sqlalchemy import String as _String
        class UUIDType(_String):
            def __init__(self):
                super().__init__(36)
            def process_bind_param(self, value, dialect):
                if value is not None and isinstance(value, _uuid.UUID):
                    return str(value)
                return value
            def process_result_value(self, value, dialect):
                if value is not None:
                    return _uuid.UUID(value)
                return value
        return UUIDType()

    def Array(item_type):
        return Column(Text, nullable=True)
