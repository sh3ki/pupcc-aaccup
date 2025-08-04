<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('home', function (Blueprint $table) {
            $table->id();

            // Carousel (4)
            for ($i = 1; $i <= 4; $i++) {
                $table->string("carousel_image_$i")->nullable();
                $table->string("carousel_title_$i")->nullable();
                $table->string("carousel_subtitle_$i")->nullable();
            }

            // Accreditors (4)
            for ($i = 1; $i <= 4; $i++) {
                $table->string("accreditor_image_$i")->nullable();
                $table->string("accreditor_name_$i")->nullable();
                $table->string("accreditor_position_$i")->nullable();
            }

            // Director
            $table->string("director_image")->nullable();
            $table->string("director_title")->nullable();
            $table->text("director_message")->nullable();
            $table->string("director_name")->nullable();
            $table->string("director_position")->nullable();

            // Videos (3)
            $table->string("videos_section_title")->nullable();
            for ($i = 1; $i <= 3; $i++) {
                $table->string("video_youtube_id_$i")->nullable();
                $table->string("video_title_$i")->nullable();
            }

            // Programs (3)
            $table->string("programs_section_title")->nullable();
            for ($i = 1; $i <= 3; $i++) {
                $table->string("program_image_$i")->nullable();
                $table->string("program_title_$i")->nullable();
                $table->text("program_description_$i")->nullable();
            }

            // Mula Sayo image
            $table->string("mula_sayo_image")->nullable();

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('home');
    }
};