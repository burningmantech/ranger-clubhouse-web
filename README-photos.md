### Photo Notes

The Clubhouse has two possible photo storage methods, controlled through the PhotoStorage setting:

* photos-s3: stores and retrieves photos through the S3 rangers-photo bucket

* photos-local: stores and retrieves photo through the local directory storage/photos

### Web Server configuration & Photo Editing

When the user's browser retrieves a photo to edit, the CORS headers has to be set correctly:

Access-Control-Allow-Origin set to '*'

If the header is not present, the browser will prevent the Clubhouse application from reading the image's contents.



