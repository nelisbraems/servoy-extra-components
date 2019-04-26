{
	"name": "servoyextra-lightboxgallery",
	"displayName": "Lightbox Gallery",
	"version": 1,
	"definition": "servoyextra/lightboxgallery/lightboxgallery.js",
	"libraries": [
		{"name":"lightbox.min.js", "version":"2.10.0", "url":"servoyextra/lightboxgallery/js/lightbox.min.js", "mimetype":"text/javascript"},
		{"name":"lightbox.min.css", "version":"2.10.0", "url":"servoyextra/lightboxgallery/css/lightbox.min.css", "mimetype":"text/css"},
		{"name":"lightboxgallery.css", "version":"1.0.0", "url":"servoyextra/lightboxgallery/lightboxgallery.css", "mimetype":"text/css"}
	],
	"model":
	{
		"imagesFoundset"			: { "type": "foundset", "dataproviders": ["image", "caption", "thumbnail", "imageId"] },
		"maxImageWidth"				: { "type": "int" },
		"maxImageHeight"			: { "type": "int" },
		"albumLabel"				: { "type": "string", "default": "image %1 of %2" },
		"fadeDuration"				: { "type": "int", "default": 600 },
		"fitImagesInViewport"		: { "type": "boolean", "default": true },
		"imageFadeDuration"			: { "type": "int", "default": 600 },
		"positionFromTop"			: { "type": "int", "default": 50 },
		"resizeDuration"			: { "type": "int", "default": 700 },
		"wrapAround"				: { "type": "boolean", "default": false },
		"galleryVisible"			: { "type": "boolean", "default": true },
		"showCaptionInGallery" 		: { "type" : "boolean", "default": false },
		"showImageNumberLabel"		: { "type": "boolean", "default": true },
		"hoverButtonIcon"			: { "type": "string", "default": "fa fa-trash fa-lg" },
		"buttonText"				: { "type": "tagstring" },
		"buttonStyleClass"			: { "type": "styleclass" },
		"enabled"					: { "type": "boolean", "default": "false" }
	},
	"api": {
		"showLightbox": {
			
		}
	},
	"handlers": {
		"onHoverButtonClicked": {
			"parameters": [
				{ "name": "event", "type": "JSEvent" },
				{ "name": "imageId", "type": "string" }
			]
		}
	}
}