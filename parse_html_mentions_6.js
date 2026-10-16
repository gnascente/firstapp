// A bug report says "an 'Edit' button is visually stretching too wide."
// The only things marked "Editar" that are buttons:
// 426:    <div class="menu-item" onclick="App.editLogFromContext()"> <i class="material-icons">edit</i> <span>Editar</span> </div>
// But this is a menu-item, not explicitly a button, but it acts like one.
// Are there any standard buttons labeled "Editar"?
// In CarouselModal: `<div class="carousel-btn edit" id="carouselEditBtn" onclick="CarouselModal.editCurrent()"><i class="material-icons">edit</i></div>`
// Wait, is it the Context Menu "Editar" that stretches too wide?
// "menu-item" class has `display: flex;` maybe it stretches?
// Is it the image in `Inspiracao.html` or similar? Let's check `17921527430663802122754766603243.jpg` using view_image tool? No, wait I can view media via read_media_file.
